'use client'

import { Result as ResultAntd, ResultProps } from 'antd'

type Props = {} & ResultProps

export const Result: React.FC<Props> = ({ ...props }) => {
    return <ResultAntd {...props} />
}
