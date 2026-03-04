import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MainFooterMenu from "@/components/MainFooterMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen antialiased flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer>
        <MainFooterMenu />
      </Footer>
    </div>
  );
}
