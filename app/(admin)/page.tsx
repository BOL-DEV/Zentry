import Hero from "@/components/Hero";
import Offer from "@/components/Offer";
import PastEvent from "@/components/PastEvent";
import Stat from "@/components/Stat";

const Home = () => {
  return (
    <div className="dark:bg-slate-950/90 bg-purple-100  ">
      <Hero />
      <Stat />
      <PastEvent />
      <Offer />
    </div>
  );
};
export default Home;
