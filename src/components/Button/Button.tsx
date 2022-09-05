import React, { FC, PropsWithChildren } from 'react'

const Button: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>
}

export default Button
