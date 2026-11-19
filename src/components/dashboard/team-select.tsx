import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export function TeamSelect({
  items,
  value,
  onValueChange,
}: {
  items: { value: string; label: string }[]
  value?: string
  onValueChange: (value: string | null) => void
}) {
  if (items.length === 0) return null

  return (
    <Select value={value} items={items} onValueChange={onValueChange}>
      <SelectTrigger className="min-w-52 max-w-72">
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent align="end">
        {items.map((team) => (
          <SelectItem key={team.value} value={team.value}>
            {team.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
