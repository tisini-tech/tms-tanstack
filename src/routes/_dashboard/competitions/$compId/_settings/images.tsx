import { useEffect } from 'react'
import { z } from 'zod'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { CompetitionImage } from '#/lib/types'
import { getCompetitionImagesFn } from '#/data/competitions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { AddCompImagesModal } from '#/components/competitions/add-images'

const competitionRoute = getRouteApi('/_dashboard/competitions/$compId')

export const Route = createFileRoute(
  '/_dashboard/competitions/$compId/_settings/images',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId } }) => ({
    seasonId,
    divisionId,
  }),
  loader: async ({ params, deps: { seasonId, divisionId } }) => {
    if (!seasonId) {
      return { images: [] as CompetitionImage[] }
    }

    const images = await getCompetitionImagesFn({
      data: {
        competitionId: params.compId,
        seasonId: String(seasonId),
        ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
      },
    })

    return { images }
  },
  component: ImagesTab,
})

function ImagesTab() {
  const { competition } = competitionRoute.useLoaderData()
  const { images } = Route.useLoaderData()
  const { seasonId, divisionId } = Route.useSearch()
  const navigate = Route.useNavigate()

  const seasonItems = competition.seasons.map((season) => ({
    value: String(season.id),
    label: season.name,
  }))
  const divisionItems = competition.divisions.map((division) => ({
    value: String(division.id),
    label: division.name,
  }))

  const selectedSeason =
    seasonId != null &&
    seasonItems.some((item) => item.value === String(seasonId))
      ? String(seasonId)
      : (seasonItems[0]?.value ?? null)

  const selectedDivision =
    divisionId != null &&
    divisionItems.some((item) => item.value === String(divisionId))
      ? String(divisionId)
      : (divisionItems[0]?.value ?? null)

  useEffect(() => {
    if (!selectedSeason) return

    const nextSeasonId = Number(selectedSeason)
    const nextDivisionId = selectedDivision
      ? Number(selectedDivision)
      : undefined

    if (seasonId === nextSeasonId && divisionId === nextDivisionId) return

    void navigate({
      search: (prev) => ({
        ...prev,
        seasonId: nextSeasonId,
        ...(nextDivisionId != null ? { divisionId: nextDivisionId } : {}),
      }),
      replace: true,
    })
  }, [divisionId, navigate, seasonId, selectedDivision, selectedSeason])

  function updateSearch(patch: { seasonId?: number; divisionId?: number }) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
      replace: true,
    })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-heading">Images</h2>
        <div className="flex gap-2">
          <Select
            value={selectedSeason}
            items={seasonItems}
            onValueChange={(value) => {
              if (value == null) return
              updateSearch({ seasonId: Number(value) })
            }}
          >
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              {seasonItems.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDivision}
            items={divisionItems}
            onValueChange={(value) => {
              if (value == null) return
              updateSearch({ divisionId: Number(value) })
            }}
          >
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Select a division" />
            </SelectTrigger>
            <SelectContent>
              {divisionItems.map((division) => (
                <SelectItem key={division.value} value={division.value}>
                  {division.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AddCompImagesModal
            competitionId={String(competition.id)}
            seasonId={selectedSeason}
            divisionId={selectedDivision}
          />
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Thumb</TableHead>
              <TableHead>Image URL</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((image) => (
              <TableRow key={image.id}>
                <TableCell>
                  <img
                    src={image.image}
                    alt={image.caption || 'Competition image'}
                    className="size-12 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell className="max-w-xs">
                  <a
                    href={image.image}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm text-muted-foreground underline-offset-2 hover:underline"
                    title={image.image}
                  >
                    {image.image}
                  </a>
                </TableCell>
                <TableCell className="max-w-sm whitespace-normal">
                  <p className="line-clamp-2 text-sm text-foreground">
                    {image.caption?.trim() || '—'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <PreviewImageButton image={image} />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Edit image ${image.id}`}
                      title="Edit"
                      onClick={() => {}}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Delete image ${image.id}`}
                      title="Delete"
                      onClick={() => {}}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

function PreviewImageButton({ image }: { image: CompetitionImage }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Preview image ${image.id}`}
            title="Preview"
          />
        }
      >
        <EyeIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{image.caption?.trim() || 'Image preview'}</DialogTitle>
        </DialogHeader>
        <img
          src={image.image}
          alt={image.caption || 'Competition image'}
          className="max-h-[70vh] w-full rounded-xl object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
