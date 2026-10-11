import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Steps from "@/components/Steps";
import BookingBuilder from "@/components/BookingBuilder";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Steps />
        <BookingBuilder />
      </main>
      <Footer />
    </div>
  );
}
