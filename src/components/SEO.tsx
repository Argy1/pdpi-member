import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
}

const BASE_URL = 'https://daftaranggota.pdpi.or.id';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export const SEO = ({
  title = 'PDPI - Perhimpunan Dokter Paru Indonesia',
  description = 'Direktori resmi anggota Perhimpunan Dokter Paru Indonesia (PDPI). Temukan dokter spesialis paru dan respirologi terpercaya di seluruh Indonesia.',
  keywords = 'PDPI, Perhimpunan Dokter Paru Indonesia, dokter paru, dokter spesialis paru, pulmonologist, respirologist, direktori dokter paru',
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
  noindex = false,
}: SEOProps) => {
  const fullTitle = title.includes('PDPI') ? title : `${title} | PDPI`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;