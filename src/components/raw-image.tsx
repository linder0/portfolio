// The one escape hatch for images next/image can't optimize: owner uploads
// served from the private Blob store via /api/images/[name], plus local
// /public assets kept on the same pipeline. Plain <img>, lazy by default.
// No hooks, so it renders from server and client components alike.
export function RawImage({
  alt = "",
  loading = "lazy",
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  ref?: React.Ref<HTMLImageElement>;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} loading={loading} {...rest} />;
}
