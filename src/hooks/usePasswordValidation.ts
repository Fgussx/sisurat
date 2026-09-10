import { useMemo } from 'react'

interface PasswordValidationState {
  isValid: boolean
  isEmpty: boolean
  message: string
  color: 'gray' | 'red' | 'green'
  icon: string
}

export function usePasswordValidation(password: string): PasswordValidationState {
  return useMemo(() => {
    const isEmpty = password === '' || password === undefined
    const isValid = password.length >= 8

    if (isEmpty) {
      return {
        isValid: false,
        isEmpty: true,
        message: '',
        color: 'gray',
        icon: '',
      }
    }

    if (isValid) {
      return {
        isValid: true,
        isEmpty: false,
        message: 'Password valid',
        color: 'green',
        icon: '✓',
      }
    }

    return {
      isValid: false,
      isEmpty: false,
      message: 'Minimal 8 karakter',
      color: 'red',
      icon: '✗',
    }
  }, [password])
}

export function usePasswordMatch(password: string, confirmPassword: string) {
  return useMemo(() => {
    const isEmpty = confirmPassword === '' || confirmPassword === undefined
    const isValid = password === confirmPassword && confirmPassword.length >= 8

    if (isEmpty) {
      return {
        isValid: false,
        isEmpty: true,
        message: '',
        color: 'gray',
        icon: '',
      }
    }

    if (isValid) {
      return {
        isValid: true,
        isEmpty: false,
        message: 'Password match',
        color: 'green',
        icon: '✓',
      }
    }

    return {
      isValid: false,
      isEmpty: false,
      message: password.length < 8 ? 'Minimal 8 karakter' : 'Password tidak cocok',
      color: 'red',
      icon: '✗',
    }
  }, [password, confirmPassword])
}
