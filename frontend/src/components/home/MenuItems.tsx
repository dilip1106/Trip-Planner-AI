import { Link } from "react-router-dom";

const MenuItems = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <li>
        <button
          onClick={() => scrollToSection('how-it-works')}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          How it works?
        </button>
      </li>
      <li>
        <button
          onClick={() => scrollToSection('public-plans')}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          Community Plans
        </button>
      </li>
      <li>
        <button
          onClick={() => scrollToSection('pricing')}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          Pricing
        </button>
      </li>
    </>
  );
};

export default MenuItems;