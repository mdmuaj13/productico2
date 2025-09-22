import { SiteHeader } from "@/components/site-header";

const AppPage = () => {
  return (
    <div>
      <SiteHeader />
      <div className="flex flex-1 min-h-screen items-center justify-center">
        Content here
      </div>
    </div>
  );
}

export default AppPage;