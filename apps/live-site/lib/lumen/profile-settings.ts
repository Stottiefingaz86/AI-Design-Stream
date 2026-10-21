/** Profile Settings — Figma WIP FkOhqSjo1EeNzvEvh4iM8s (11129:29784). */

export type ProfilePersonalDetails = {
  firstName: string
  lastName: string
  email: string
  mobile: string
  country: string
  state: string
  address: string
  city: string
  zipCode: string
}

/** Demo ledger matching Figma Personal Details filled samples. */
export const PROFILE_PERSONAL_DETAILS: ProfilePersonalDetails = {
  firstName: 'Nicolás',
  lastName: 'Cauterucci',
  email: 'n**************i@g****.c**',
  mobile: '+1*******989',
  country: 'United States',
  state: 'New York',
  address: '930 5th Ave',
  city: 'New York',
  zipCode: '10021',
}

export const PROFILE_DETAIL_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'mobile', label: 'Mobile Number' },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'zipCode', label: 'Zip Code' },
] as const satisfies ReadonlyArray<{
  key: keyof ProfilePersonalDetails
  label: string
}>
