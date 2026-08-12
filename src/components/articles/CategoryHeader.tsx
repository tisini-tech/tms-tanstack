import { useNavigate } from "react-router-dom";

import { FaArrowCircleRight } from "react-icons/fa";

type HeaderProps = {
  category: string;
};

const CategoryHeader = ({ category }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-t-2 border-primary">
      <div className="flex items-center justify-between px-0 py-3">
        <span className="text-lg font-bold text-primary uppercase">
          {category}
        </span>

        <div
          onClick={() => navigate(`/articles/categories/${category}`)}
          className="flex items-center gap-1 text-primary-lightest hover:text-primary cursor-pointer"
        >
          <span className="">View All</span>
          <FaArrowCircleRight />
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
