import { Typography, Box, Link, Chip, IconButton, CircularProgress, Tooltip } from '@mui/material'
import { ContentCopy, DeleteOutline, Refresh, ErrorOutline } from '@mui/icons-material'
import { CardWrapper, CardBody, CardActionBar, CategoryChipRow } from './styles'
import type { ProductCardProps } from './types'

export const ProductCard = ({ product, onScrape, onCopy, onRemove }: ProductCardProps) => {
  const { id, provider, title, price, link, categorized, isAnalyzing, error } = product
  const breadcrumbs = categorized?.breadcrumbsWithLinks ?? []

  return (
    <CardWrapper variant="outlined">
      <CardBody>
        <Typography variant="caption" color="primary" fontWeight="bold">{provider}</Typography>
        <Typography variant="subtitle2" fontWeight="bold" noWrap title={title} mt={0.5}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Preço Original: {price || 'N/A'}
        </Typography>
        {categorized && (
          <Typography variant="body2" color="secondary" fontWeight="bold" mt={0.5}>
            Preço Web: {categorized.price || 'N/A'}
          </Typography>
        )}
        {breadcrumbs.length > 0 && (
          <CategoryChipRow>
            {breadcrumbs.map((crumb) => (
              <Chip
                key={crumb.name}
                label={crumb.name}
                size="small"
                variant="outlined"
                color={crumb.mainCategory ? 'secondary' : 'default'}
              />
            ))}
          </CategoryChipRow>
        )}
        {error && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
            <ErrorOutline sx={{ fontSize: 14 }} color="error" />
            <Typography variant="caption" color="error" noWrap title={error}>{error}</Typography>
          </Box>
        )}
        <Box mt={1.5}>
          <Link href={link} target="_blank" rel="noopener" color="inherit" variant="caption">
            Acessar link original
          </Link>
        </Box>
      </CardBody>
      <CardActionBar>
        <Tooltip title="Raspar produto individualmente">
          <span>
            <IconButton size="small" color="secondary" onClick={() => onScrape(id)} disabled={isAnalyzing}>
              {isAnalyzing
                ? <CircularProgress size={14} color="secondary" />
                : <Refresh fontSize="small" />
              }
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Copiar objeto JSON">
          <IconButton size="small" color="inherit" onClick={() => onCopy(id)}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover produto">
          <IconButton size="small" color="error" onClick={() => onRemove(id)}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActionBar>
    </CardWrapper>
  )
}
