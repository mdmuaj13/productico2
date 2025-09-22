import { GalleryVerticalEnd } from 'lucide-react';

import { SignupForm } from '@/components/signup-form';
import GuestGuard from '@/components/guest-guard';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <GuestGuard>
      <div className="grid min-h-svh lg:grid-cols-2">
			<div className="bg-muted relative hidden lg:block">
				<Image
					src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=735&auto=format&fit=crop"
					alt="Image"
					className="object-cover"
					fill
				/>
			</div>
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link href="/" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEnd className="size-4" />
						</div>
						Productico
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<SignupForm />
					</div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}