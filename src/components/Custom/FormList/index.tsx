'use client'

import { ButtonIcon } from '../ButtonIcon'
import { Form, Input } from 'antd'
import { MinusIcon, PlusCircleIcon } from 'lucide-react'

type Props = {
  name: string
  keyName?: string
  valueName?: string
  keyTitle?: string
  valueTitle?: string
  className?: string
  allowEmpty?: boolean
}

export const FormList: React.FC<Props> = ({
  name,
  keyTitle = 'Key',
  valueTitle = 'Value',
  keyName = 'key',
  valueName = 'value',
  className,
  allowEmpty = false,
}) => {
  return (
    <div className={className}>
      <div className="w-full flex items-center mb-2 font-medium">
        <div className="mr-4 w-1/3">{keyTitle}</div>
        <div className="flex-1">{valueTitle}</div>
      </div>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item required={false} key={index}>
                <div className="w-full flex items-start">
                  <Form.Item
                    className="mb-0 mr-2 w-1/3"
                    name={[field.name, keyName]}
                    rules={[
                      {
                        pattern: /^[a-zA-Z0-9_]+$/,
                        message: 'Only accept a-z, A-Z, 0-9, _',
                      },
                      {
                        required: true,
                        message: 'Field required',
                      },
                    ]}
                  >
                    <Input placeholder="e.g. CLIENT_KEY" />
                  </Form.Item>
                  <Form.Item
                    className="mb-0 mr-2 flex-1"
                    name={[field.name, valueName]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input />
                  </Form.Item>
                  <ButtonIcon
                    onClick={() => remove(field.name)}
                    size="middle"
                    type="default"
                    disabled={!allowEmpty ? fields.length === 1 : false}
                    icon={<MinusIcon size={16} />}
                  />
                </div>
              </Form.Item>
            ))}
            <ButtonIcon onClick={() => add()} size="middle" type="default" icon={<PlusCircleIcon size={16} />}>
              Add another
            </ButtonIcon>
          </>
        )}
      </Form.List>
    </div>
  )
}
