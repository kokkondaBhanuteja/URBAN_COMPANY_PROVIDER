import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the login page as the root
  redirect('/login');
}
