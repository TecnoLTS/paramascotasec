'use client'

import CheckoutLocationPicker from '@/components/Checkout/CheckoutLocationPicker'
import { CaretDown, Plus, Trash } from '@phosphor-icons/react/dist/ssr'

type CustomerAddressPanelProps = Record<string, any>

export default function CustomerAddressPanel({
  activeAddress,
  addressLoading,
  addressSaving,
  addNewAddress,
  currentAddress,
  currentAddrIndex,
  handleActiveAddress,
  handleBillingChange,
  handleSaveAddresses,
  handleShippingChange,
  makePrimaryAddress,
  removeAddress,
  savedAddresses,
  setCurrentAddrIndex,
  shippingRates,
  toggleSameAsShipping,
  updateAddressPartial,
}: CustomerAddressPanelProps) {
  return (
    <div className="tab_address text-content w-full p-7 border border-line rounded-xl">
      <div className="heading5 pb-4">Direcciones guardadas</div>
      <form onSubmit={handleSaveAddresses}>
        <div className="flex items-center justify-between mb-8 border-b border-line pb-4">
          <div className="flex gap-4">
            {savedAddresses.map((addr: any, index: number) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => setCurrentAddrIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentAddrIndex === index ? 'bg-black text-white' : 'bg-surface border border-line text-secondary hover:bg-line'}`}
              >
                {addr.title}{index === 0 ? ' · Principal' : ''}
              </button>
            ))}
            {(savedAddresses.length < 3) && (
              <button
                type="button"
                onClick={addNewAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20"
              >
                <Plus size={16} /> Agregar
              </button>
            )}
          </div>
          {savedAddresses.length > 1 && (
            <div className="flex items-center gap-4">
              {currentAddrIndex > 0 && (
                <button
                  type="button"
                  onClick={() => makePrimaryAddress(currentAddrIndex)}
                  className="text-success hover:underline text-sm font-bold"
                >
                  Marcar como principal
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAddress(currentAddrIndex)}
                className="text-red hover:underline text-sm font-bold flex items-center gap-1"
              >
                <Trash size={16} /> Eliminar actual
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`tab_btn flex items-center justify-between w-full pb-1.5 border-b border-line ${activeAddress === 'shipping' ? 'active' : ''}`}
          onClick={() => handleActiveAddress('shipping')}
        >
          <strong className="heading6">Dirección de envío</strong>
          <CaretDown className="text-2xl ic_down duration-300" />
        </button>
        <div className={`form_address ${activeAddress === 'shipping' ? 'block' : 'hidden'}`}>
          <div className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-5">
            <div className="first-name">
              <label htmlFor="shippingFirstName" className="caption1 capitalize">Nombre <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingFirstName" type="text" value={currentAddress.shipping.firstName} onChange={handleShippingChange} required />
            </div>
            <div className="last-name">
              <label htmlFor="shippingLastName" className="caption1 capitalize">Apellido <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingLastName" type="text" value={currentAddress.shipping.lastName} onChange={handleShippingChange} required />
            </div>
            <div className="company">
              <label htmlFor="shippingCompany" className="caption1 capitalize">Nombre de la empresa (opcional)</label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCompany" type="text" value={currentAddress.shipping.company} onChange={handleShippingChange} />
            </div>
            <div className="country">
              <label htmlFor="shippingCountry" className="caption1 capitalize">País / Región <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg bg-surface" id="shippingCountry" type="text" value={currentAddress.shipping.country || 'Ecuador'} onChange={handleShippingChange} required readOnly />
            </div>
            <div className="street">
              <label htmlFor="shippingStreet" className="caption1 capitalize">Dirección <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingStreet" type="text" value={currentAddress.shipping.street} onChange={handleShippingChange} required />
            </div>
            <div className="city">
              <label htmlFor="shippingCity" className="caption1 capitalize">Ciudad <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCity" type="text" value={currentAddress.shipping.city} onChange={handleShippingChange} required />
            </div>
            <div className="state">
              <label htmlFor="shippingState" className="caption1 capitalize">Estado / Provincia <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingState" type="text" value={currentAddress.shipping.state} onChange={handleShippingChange} required />
            </div>
            <div className="zip">
              <label htmlFor="shippingZip" className="caption1 capitalize">Código Postal <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingZip" type="text" value={currentAddress.shipping.zip} onChange={handleShippingChange} required />
            </div>
            <div className="phone">
              <label htmlFor="shippingPhone" className="caption1 capitalize">Teléfono <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingPhone" type="text" value={currentAddress.shipping.phone} onChange={handleShippingChange} required />
            </div>
            <div className="email">
              <label htmlFor="shippingEmail" className="caption1 capitalize">Correo electrónico <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingEmail" type="email" value={currentAddress.shipping.email} onChange={handleShippingChange} required />
            </div>
            <div className="sm:col-span-2">
              <CheckoutLocationPicker
                address={currentAddress.shipping}
                storeLocation={{
                  address: shippingRates.storeAddress,
                  latitude: shippingRates.storeLatitude,
                  longitude: shippingRates.storeLongitude,
                  freeShippingRadiusKm: shippingRates.freeShippingRadiusKm,
                }}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                usageConfig={{
                  minSearchLength: shippingRates.mapMinSearchChars,
                  lookupCooldownSeconds: shippingRates.mapLookupCooldownSeconds,
                  maxLookupsPerSession: shippingRates.mapSessionLookupLimit,
                }}
                sessionStorageNamespace={`my-account-address-${currentAddress.id}`}
                onAddressChange={(partial) => updateAddressPartial('shipping', partial)}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`tab_btn flex items-center justify-between w-full mt-8 pb-1.5 border-b border-line ${activeAddress === 'billing' ? 'active' : ''}`}
          onClick={() => handleActiveAddress('billing')}
        >
          <strong className="heading6">Dirección de facturación</strong>
          <CaretDown className="text-2xl ic_down duration-300" />
        </button>
        <div className={`form_address ${activeAddress === 'billing' ? 'block' : 'hidden'}`}>
          <div className={`flex items-center gap-3 mt-4 px-4 py-3 bg-surface rounded-lg border border-line ${currentAddress.isSame ? 'bg-success/5 border-success/30' : ''}`}>
            <input
              type="checkbox"
              id="sameAsShippingBilling"
              checked={currentAddress.isSame}
              onChange={toggleSameAsShipping}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="sameAsShippingBilling" className="caption1 cursor-pointer font-bold text-secondary">Usar la misma dirección de envío también para facturación</label>
          </div>
          {currentAddress.isSame && (
            <div className="mt-4 px-4 py-3 rounded-lg border border-success/25 bg-success/5 text-sm text-secondary">
              La facturación usará exactamente los mismos datos de la dirección de envío actual.
            </div>
          )}
          <div className={`grid sm:grid-cols-2 gap-4 gap-y-5 mt-5 ${currentAddress.isSame ? 'opacity-60' : ''}`}>
            {[
              ['billingFirstName', 'Nombre', 'firstName', 'text', true],
              ['billingLastName', 'Apellido', 'lastName', 'text', true],
              ['billingCompany', 'Nombre de la empresa (opcional)', 'company', 'text', false],
              ['billingCountry', 'País / Región', 'country', 'text', true],
              ['billingStreet', 'Dirección', 'street', 'text', true],
              ['billingCity', 'Ciudad', 'city', 'text', true],
              ['billingState', 'Estado / Provincia', 'state', 'text', true],
              ['billingZip', 'Código Postal', 'zip', 'text', true],
              ['billingPhone', 'Teléfono', 'phone', 'text', true],
              ['billingEmail', 'Correo electrónico', 'email', 'email', true],
            ].map(([id, label, field, type, required]) => (
              <div key={String(id)} className={String(field)}>
                <label htmlFor={String(id)} className="caption1 capitalize">{String(label)} {required ? <span className="text-red">*</span> : null}</label>
                <input
                  className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary"
                  id={String(id)}
                  type={String(type)}
                  value={String(currentAddress.billing[String(field)] || (field === 'country' ? 'Ecuador' : ''))}
                  onChange={handleBillingChange}
                  disabled={currentAddress.isSame}
                  required={Boolean(required) && !currentAddress.isSame}
                  readOnly={field === 'country'}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="block-button md:mt-10 mt-6 flex justify-end">
          <button className="button-main py-3 px-10 rounded-full font-bold bg-black text-white hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={addressSaving || addressLoading}>
            {addressSaving ? 'Guardando...' : 'Guardar Direcciones'}
          </button>
        </div>
      </form>
    </div>
  )
}
