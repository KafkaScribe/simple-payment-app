import { redirect } from 'next/navigation';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

export default function RootPage() {
  redirect(`/$${CASHTAG}`);
}
