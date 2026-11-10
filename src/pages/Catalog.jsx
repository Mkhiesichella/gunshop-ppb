import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import { useDebounce } from '../hooks/useDebounce'
import Pagination from '../components/common/Pagination'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

/**
 * Catalog page — the main product listing.
 *
 * Data source priority:
 *   1. Live API via useGuns()
 *   2. Local static array (GUNS_LOCAL) when the API is unreachable
 *
 * Features: search, category filter, sort, CRUD actions, detail modal.
 */
const PAGE_SIZE = 8
const CATEGORIES = ['All', 'Pistol', 'Rifle', 'Shotgun', 'Submachine Gun']

export default function Catalog({ onNavigate }) {
  const queryClient = useQueryClient()

  // ---- filters / sort / page (sent to the server) ----
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  // Any filter change goes back to page 1
  const onSearch = (v) => { setSearch(v); setPage(1) }
  const onCategory = (v) => { setActiveCategory(v); setPage(1) }
  const onSort = ({ key, order }) => { setSortKey(key); setSortOrder(order); setPage(1) }

  // ---- API data (paginated + cached) ----
  const params = useMemo(
    () => ({
      search: debouncedSearch,
      category: activeCategory,
      sort_by: sortKey,
      order: sortOrder,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, activeCategory, sortKey, sortOrder, page],
  )
  const { guns: apiGuns, loading, fetching, error, pagination, refetch } = useGuns(params)
  const [useLocal, setUseLocal] = useState(false)

  const isLocal = useLocal || (error && apiGuns.length === 0)

  // Decide data source
  const rawGuns = useMemo(() => {
    if (isLocal) {
      // Enrich local data with synthetic ids so FavoriteButton and detail work
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, isLocal])

  const categories = useMemo(
    () => (isLocal ? extractCategories(rawGuns) : CATEGORIES),
    [rawGuns, isLocal],
  )

  // Server already filtered + sorted + paged. Only the offline fallback filters locally.
  const filteredGuns = useMemo(() => {
    if (!isLocal) return rawGuns
    const result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, isLocal, search, activeCategory, sortKey, sortOrder])

  const totalItems = isLocal ? filteredGuns.length : (pagination?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  // ---- detail view ----
  const [selectedGun, setSelectedGun] = useState(null)

  // ---- delete ----
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await gunService.deleteGun(deleteTarget.id)
      setDeleteTarget(null)
      // cache invalidation: list is refetched so it never shows the deleted item
      await queryClient.invalidateQueries({ queryKey: ['guns'] })
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  // ---- If viewing a single product detail ----
  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => { setSelectedGun(null); setDeleteTarget(g) }}
      />
    )
  }

  // ---- Main catalog view ----
  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed
          with its type, caliber, and price — nothing else.
        </p>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock {fetching && !loading && <Loader size={14} className="spin" />}</h2>
          <div className="list-head-right">
            <span className="count">
              {totalItems} piece{totalItems !== 1 ? 's' : ''}
            </span>
            {onNavigate && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <AdvancedFilter
          search={search}
          onSearch={onSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={onCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={onSort}
        />

        {/* States */}
        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && error && !useLocal && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <div className="state-box__actions">
              <button type="button" className="btn btn--outline" onClick={refetch}>
                <RefreshCw size={16} /> Retry
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setUseLocal(true)}
              >
                View Local Catalog
              </button>
            </div>
          </div>
        )}

        {!loading && filteredGuns.length === 0 && !error && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}

        {/* Product grid */}
        {filteredGuns.length > 0 && (
          <ul className="stock">
            {filteredGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={setSelectedGun}
                onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onDelete={setDeleteTarget}
              />
            ))}
          </ul>
        )}

        {/* Pagination (server-side) */}
        {!isLocal && (
          <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        )}

        {useLocal && (
          <p className="local-notice">
            Showing local catalog (server unavailable).{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setUseLocal(false); refetch() }}
            >
              Retry server
            </button>
          </p>
        )}
      </section>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
      />
      {deleteError && (
        <div className="toast toast--error">{deleteError}</div>
      )}
    </>
  )
}
