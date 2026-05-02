export interface MicrosoftProfile {
  id: string
  email: string
}

export const signInWithMicrosoft = async (email: string): Promise<MicrosoftProfile> => {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail.endsWith('@outlook.com')) {
    throw new Error('Use a Microsoft Outlook account ending with @outlook.com.')
  }

  return {
    id: crypto.randomUUID(),
    email: normalizedEmail,
  }
}
