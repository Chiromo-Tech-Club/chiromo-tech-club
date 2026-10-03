/**
 * Client-safe membership QR helpers.
 * Uses SVG output so print HTML can embed the code inline (no canvas / broken img).
 */

export function buildMembershipQrPayload(membershipId: string, memberId?: string): string {
  const params = new URLSearchParams({ mid: membershipId });
  if (memberId) params.set("member", memberId);
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/verify?${params.toString()}`;
  }
  return membershipId;
}

export async function generateMembershipQrSvg(
  membershipId: string,
  colors?: { dark?: string; light?: string },
  memberId?: string,
): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const payload = buildMembershipQrPayload(membershipId, memberId);
  const raw = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: colors?.dark ?? "#0B1324",
      light: colors?.light ?? "#FFFFFF",
    },
  });

  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 256 256";

  return raw.replace(
    /<svg[^>]*>/i,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`,
  );
}
