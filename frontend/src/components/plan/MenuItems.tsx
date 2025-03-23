import { Link } from "react-router-dom";

interface MenuItemsProps {
  isPublic: boolean;
}

const MenuItems = ({ isPublic }: MenuItemsProps) => {
  return (
    <>
      {!isPublic && (
        <li>
          <Link 
            to="/dashboard" 
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </li>
      )}
      <li>
        <Link 
          to="/community-plans" 
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          Community Plans
        </Link>
      </li>
    </>
  );
};

export default MenuItems;