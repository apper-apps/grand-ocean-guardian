import BottomNavigation from "@/components/molecules/BottomNavigation";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20 px-4 py-6 max-w-4xl mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;