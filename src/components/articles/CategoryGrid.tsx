import { Link } from "react-router-dom";

import CategoryHeader from "./CategoryHeader";
import { ArticleInterface, CategoryArticle } from "@/lib/types";
import { formatDate } from "@/lib/data/formatDate";

type GridProps = {
  categoryArticles: CategoryArticle;
};

const CategoryGrid = ({ categoryArticles }: GridProps) => {
  const articles = categoryArticles.articles;

  return (
    <div className="w-full">
      <CategoryHeader category={categoryArticles.category} />

      <div className="mb-5 w-full h-48 overflow-hidden relative">
        <Link to={`/articles/${articles[0].slug}`}>
          <img
            src={articles[0].featured_image_url!}
            alt={articles[0].excerpt}
            className="w-full object-cover cursor-pointer hover:scale-110 transition"
          />

          <div className="absolute bottom-0 left-0 flex flex-col bg-black-lighter/40 pt-1 h-[4.0rem] md:h-[4.8rem]">
            <ul className="hidden md:flex items-center gap-3 text-white text-xs font-semibold ml-4 hover:text-primary cursor-pointer">
              <li>{`${articles[0].author.first_name} ${articles[0].author.last_name}`}</li>
              <li>{formatDate(articles[0].publish)}</li>
            </ul>
            <h3 className="px-4 py-2 text-white text-xs font-semibold transition-all hover:text-primary cursor-pointer overflow-hidden text-ellipsis line-clamp-3">
              {articles[0].article_title}
            </h3>
          </div>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-4 pt-5 border-t border-primary-lightest mt-5">
          <ArticleGrid article={articles[1]} />
          <ArticleGrid article={articles[2]} />
        </div>

        <div className="flex items-center gap-4 pt-5 border-t border-primary-lightest mt-5">
          <ArticleGrid article={articles[3]} />
          <ArticleGrid article={articles[4]} />
        </div>
      </div>
    </div>
  );
};

type ArticleProps = {
  article: ArticleInterface;
};

const ArticleGrid = ({ article }: ArticleProps) => {
  return (
    <div className="flex flex-col w-1/2">
      <Link to={`/articles/${article.slug}`} className="w-full space-y-2">
        <img
          src={article.featured_image_url!}
          alt={article.excerpt}
          className="w-full h-32 object-cover hover:scale-110 transition"
        />

        <ul className="hidden md:flex items-center justify-between text-gray-400 text-xs font-semibold  hover:text-primary cursor-pointer mb-2">
          <li>{`${article.author.first_name} ${article.author.last_name}`}</li>
          <li>{formatDate(article.publish)}</li>
        </ul>

        <h3 className="text-gray-600 text-xs font-semibold transition-all hover:text-primary cursor-pointer overflow-hidden text-ellipsis line-clamp-3">
          {article.article_title}
        </h3>
      </Link>
    </div>
  );
};

export default CategoryGrid;
