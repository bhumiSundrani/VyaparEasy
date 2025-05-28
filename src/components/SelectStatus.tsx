import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export interface Status {
  name: string
}

const SelectStatus = ({ value, onChange }: { value: string | null, onChange: (value: string) => void }) => {
 

  return (
    <Select onValueChange={onChange} value={value || ''}>
    <SelectTrigger>
        <SelectValue placeholder="All" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="in-stock">In Stock</SelectItem>
        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
    </SelectContent>
</Select>
  )
}

export default SelectStatus
