import clsx from 'clsx'
import { FC } from 'react'
import { FieldError } from 'react-hook-form'

interface InputErrorMessageProps {
  error: FieldError | undefined
  className?: string
}

export const InputErrorMessage: FC<InputErrorMessageProps> = ({
  error,
  className,
}) =>
  error?.message ? (
    <span className={clsx('mt-1 ml-1 text-xs text-error', className)}>
      {error.message}
    </span>
  ) : null
