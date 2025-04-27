import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
const mockTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockManufacturer = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"

// Mock contract state
let authorizedManufacturers = new Map()
let admin = mockTxSender

// Mock contract functions
const isAdmin = () => mockTxSender === admin

const authorizeManufacturer = (manufacturer: string) => {
  if (!isAdmin()) {
    return { type: "err", value: 102 } // ERR-NOT-ADMIN
  }
  
  if (authorizedManufacturers.has(manufacturer)) {
    return { type: "err", value: 101 } // ERR-ALREADY-AUTHORIZED
  }
  
  authorizedManufacturers.set(manufacturer, true)
  return { type: "ok", value: true }
}

const revokeManufacturer = (manufacturer: string) => {
  if (!isAdmin()) {
    return { type: "err", value: 102 } // ERR-NOT-ADMIN
  }
  
  if (!authorizedManufacturers.has(manufacturer)) {
    return { type: "err", value: 100 } // ERR-NOT-AUTHORIZED
  }
  
  authorizedManufacturers.delete(manufacturer)
  return { type: "ok", value: true }
}

const isAuthorizedManufacturer = (manufacturer: string) => {
  return authorizedManufacturers.has(manufacturer) ? true : false
}

const transferAdmin = (newAdmin: string) => {
  if (!isAdmin()) {
    return { type: "err", value: 102 } // ERR-NOT-ADMIN
  }
  
  admin = newAdmin
  return { type: "ok", value: true }
}

describe("Manufacturer Verification Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    authorizedManufacturers = new Map()
    admin = mockTxSender
  })
  
  it("should authorize a manufacturer", () => {
    const result = authorizeManufacturer(mockManufacturer)
    expect(result).toEqual({ type: "ok", value: true })
    expect(isAuthorizedManufacturer(mockManufacturer)).toBe(true)
  })
  
  it("should not authorize an already authorized manufacturer", () => {
    authorizeManufacturer(mockManufacturer)
    const result = authorizeManufacturer(mockManufacturer)
    expect(result).toEqual({ type: "err", value: 101 })
  })
  
  it("should revoke a manufacturer", () => {
    authorizeManufacturer(mockManufacturer)
    const result = revokeManufacturer(mockManufacturer)
    expect(result).toEqual({ type: "ok", value: true })
    expect(isAuthorizedManufacturer(mockManufacturer)).toBe(false)
  })
  
  it("should not revoke an unauthorized manufacturer", () => {
    const result = revokeManufacturer(mockManufacturer)
    expect(result).toEqual({ type: "err", value: 100 })
  })
  
  it("should transfer admin rights", () => {
    const newAdmin = "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0"
    const result = transferAdmin(newAdmin)
    expect(result).toEqual({ type: "ok", value: true })
    expect(admin).toBe(newAdmin)
  })
})
