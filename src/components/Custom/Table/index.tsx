'use client'

import { Table as TableAntd, TableProps } from 'antd'

type Props = TableProps<any>

export const Table: React.FC<Props> = ({ ...props }) => {
    return (
        <TableAntd
            size="small"
            scroll={{
                x: 'auto',
            }}
            {...props}
        />
    )
}
