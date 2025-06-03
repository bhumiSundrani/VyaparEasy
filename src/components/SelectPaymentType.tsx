import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const SelectPaymentType = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {

  const fetchLabel = (value: string) => {
    if(value === 'cash') return "Cash"
    else "Credit"
  }

  return (
    <Select onValueChange={(val) => onChange(val)} value={value} >
        <SelectTrigger>
            <SelectValue className='text-sm sm:text-base'>{fetchLabel(value)}</SelectValue> 
        </SelectTrigger>
        <SelectContent>
            <SelectItem value='cash'>Cash</SelectItem>
            <SelectItem value='credit'>Credit</SelectItem>
        </SelectContent>
    </Select>
  )
}
