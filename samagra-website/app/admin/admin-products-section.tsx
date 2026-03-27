'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminConfirmDialog } from './admin-confirm-dialog';
import { IconPlus, IconSave, IconTrash } from './admin-action-icons';
import { AdminSubmitButton } from './admin-form-status';
import { adminMessages, formatAdminMessage } from './admin-messages';
import { useAdminToast } from './admin-toast';
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from './actions';
import { formatCurrency, formatStatus } from './format-display';
import type { Product } from './lib';

const CATALOG_CATEGORIES = [
  { key: 'all' as const, label: adminMessages.products.tabs.all },
  { key: 'solar_panel' as const, label: adminMessages.products.tabs.solar_panel },
  { key: 'solar_inverter' as const, label: adminMessages.products.tabs.solar_inverter },
  { key: 'solar_battery' as const, label: adminMessages.products.tabs.solar_battery },
  { key: 'installation_package' as const, label: adminMessages.products.tabs.installation_package },
];

function AdminProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateState, updateAction] = useActionState(updateProductAction, null);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteProductAction, null);

  useEffect(() => {
    if (deleteState !== null) {
      setDeleteModalOpen(false);
    }
  }, [deleteState]);

  useEffect(() => {
    if (updateState?.ok || deleteState?.ok) {
      router.refresh();
    }
  }, [updateState, deleteState, router]);

  useEffect(() => {
    if (updateState?.ok) {
      pushToast({ variant: 'success', message: updateState.message });
    } else if (updateState?.ok === false) {
      pushToast({ variant: 'error', message: updateState.error });
    }
  }, [updateState, pushToast]);

  useEffect(() => {
    if (deleteState?.ok) {
      pushToast({ variant: 'success', message: deleteState.message });
    } else if (deleteState?.ok === false) {
      pushToast({ variant: 'error', message: deleteState.error });
    }
  }, [deleteState, pushToast]);

  return (
    <div className="admin-item-card">
      <div className="admin-item-head">
        <div>
          <strong>{product.name}</strong>
          <span>{formatStatus(product.category)}</span>
        </div>
        <em>{formatCurrency(product.estimatedPrice)}</em>
      </div>
      <p>{product.description}</p>
      <div className="admin-product-row-actions">
        <form action={updateAction} className="admin-inline-form">
          <input type="hidden" name="id" value={product.id} />
          <input name="estimatedPrice" type="number" defaultValue={product.estimatedPrice} />
          <input
            name="warrantyYears"
            type="number"
            defaultValue={product.warrantyYears ?? ''}
            placeholder=""
          />
          <label className="admin-checkbox compact">
            <input name="active" type="checkbox" defaultChecked={product.active} />
            <span>Active</span>
          </label>
          <AdminSubmitButton
            idleLabel={adminMessages.products.saveChanges}
            pendingLabel={adminMessages.products.savingChanges}
            icon={<IconSave />}
          />
        </form>
        <form
          ref={deleteFormRef}
          action={deleteAction}
          className="admin-inline-delete-form"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          aria-hidden
          tabIndex={-1}
        >
          <input type="hidden" name="id" value={product.id} />
        </form>
        <button
          type="button"
          className="admin-danger-btn admin-submit-btn--icon"
          onClick={() => setDeleteModalOpen(true)}
          aria-label={adminMessages.products.deleteProduct}
          title={adminMessages.products.deleteProduct}
        >
          <span className="admin-btn-icon-inner" aria-hidden="true">
            <IconTrash />
          </span>
        </button>
        <AdminConfirmDialog
          open={deleteModalOpen}
          title={adminMessages.products.deleteTitle}
          description={formatAdminMessage(adminMessages.products.deleteDescription, { name: product.name })}
          confirmLabel={adminMessages.products.deleteProduct}
          confirmPendingLabel={adminMessages.products.deletePending}
          cancelLabel={adminMessages.products.cancel}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={() => deleteFormRef.current?.requestSubmit()}
          variant="danger"
          pending={isDeletePending}
        />
      </div>
    </div>
  );
}

export function AdminProductsSection({ products }: { products: Product[] }) {
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<(typeof CATALOG_CATEGORIES)[number]['key']>('all');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [createState, createAction] = useActionState(createProductAction, null);

  const filteredProducts = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    return products.filter((product) => {
      const catOk = catalogCategory === 'all' || product.category === catalogCategory;
      const textOk =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [products, catalogCategory, catalogQuery]);

  useEffect(() => {
    if (createState?.ok) {
      pushToast({ variant: 'success', message: createState.message });
      router.refresh();
      setShowCreateForm(false);
    } else if (createState?.ok === false) {
      pushToast({ variant: 'error', message: createState.error });
    }
  }, [createState, router, pushToast]);

  return (
    <section className="admin-section" id="products">
      <div className="admin-section-header">
        <div>
          <span className="section-tag">{adminMessages.products.tag}</span>
          <h2>{adminMessages.products.title}</h2>
        </div>
        <button
          type="button"
          className={`admin-plus-action${showCreateForm ? ' is-open' : ''}`}
          onClick={() => setShowCreateForm((prev) => !prev)}
          aria-expanded={showCreateForm}
          aria-controls="admin-create-product-form"
          aria-label={showCreateForm ? adminMessages.products.hideAddForm : adminMessages.products.showAddForm}
          title={showCreateForm ? adminMessages.products.hideAddForm : adminMessages.products.addProduct}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div className="admin-management-grid admin-management-grid-stack">
        {showCreateForm ? (
          <article id="admin-create-product-form" className="admin-form-card admin-surface-card">
            <h3>{adminMessages.products.newProduct}</h3>
            <form action={createAction} className="admin-stack-form" key={products.length}>
              <div className="admin-form-group">
                <label>{adminMessages.products.name}</label>
                <input name="name" required />
              </div>
              <div className="admin-form-group">
                <label>{adminMessages.products.category}</label>
                <select name="category" defaultValue="solar_panel">
                  <option value="solar_panel">Solar Panel</option>
                  <option value="solar_inverter">Solar Inverter</option>
                  <option value="solar_battery">Solar Battery</option>
                  <option value="installation_package">Installation Package</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>{adminMessages.products.details}</label>
                <textarea name="description" rows={4} required />
              </div>
              <div className="admin-form-split">
                <div className="admin-form-group">
                  <label>{adminMessages.products.price}</label>
                  <input name="estimatedPrice" type="number" min="0" required />
                </div>
                <div className="admin-form-group">
                  <label>{adminMessages.products.kw}</label>
                  <input name="capacityKw" type="number" min="0" step="0.1" />
                </div>
              </div>
              <div className="admin-form-split">
                <div className="admin-form-group">
                  <label>{adminMessages.products.warranty}</label>
                  <input name="warrantyYears" type="number" min="0" />
                </div>
                <div className="admin-form-group">
                  <label>{adminMessages.products.compatibility}</label>
                  <input name="compatibility" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>{adminMessages.products.images}</label>
                <input name="imageUrls" />
              </div>
              <label className="admin-checkbox">
                <input name="active" type="checkbox" defaultChecked />
                <span>{adminMessages.products.active}</span>
              </label>
              <AdminSubmitButton
                idleLabel={adminMessages.products.createProduct}
                pendingLabel={adminMessages.products.creatingProduct}
                className="btn-orange"
                icon={<IconPlus />}
                showLabelWithIcon
              />
            </form>
          </article>
        ) : null}

        <article className="admin-list-card admin-surface-card">
          <div className="admin-list-heading">
            <h3>{adminMessages.products.items}</h3>
            <span>
              {formatAdminMessage(adminMessages.products.shownCount, {
                shown: filteredProducts.length,
                total: products.length,
              })}
            </span>
          </div>
          <div className="admin-catalog-toolbar">
            <div className="admin-catalog-search">
              <label className="admin-visually-hidden" htmlFor="admin-catalog-q">
                {adminMessages.products.searchProducts}
              </label>
              <input
                id="admin-catalog-q"
                type="search"
                placeholder={adminMessages.products.searchPlaceholder}
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="admin-catalog-chips" role="group" aria-label="Filter by category">
              {CATALOG_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`admin-catalog-chip${catalogCategory === c.key ? ' is-active' : ''}`}
                  onClick={() => setCatalogCategory(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-card-list">
            {filteredProducts.map((product) => (
              <AdminProductRow key={product.id} product={product} />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
