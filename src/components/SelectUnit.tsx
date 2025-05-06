import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const SelectUnit = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {

  return (
    <Select onValueChange={(val) => onChange(val)} value={value}>
        <SelectTrigger>
            <SelectValue>{value}</SelectValue> 
        </SelectTrigger>
        <SelectContent>
            <SelectItem value='kg'>kg</SelectItem>
            <SelectItem value='gm'>gm</SelectItem>
            <SelectItem value='liter'>liter</SelectItem>
            <SelectItem value='ml'>ml</SelectItem>
            <SelectItem value='pcs'>pcs</SelectItem>
        </SelectContent>
    </Select>
  )
}

export default SelectUnit
