import { Link } from "react-router-dom";

import CategoryHeader from "./CategoryHeader";
import { ArticleInterface, CategoryArticle } from "@/lib/types";
import { formatDate } from "@/lib/data/formatDate";

type ColumnProps = {
  categoryArticles: CategoryArticle;
};

const CategoryColumn = ({ categoryArticles }: ColumnProps) => {
  const articles = categoryArticles.articles;

  return (
    <div className="w-full">
      <CategoryHeader category={categoryArticles.category} />

      <div className="mb-5 w-full h-48 overflow-hidden relative">
        <img
          src={articles[0].featured_image_url!}
          alt={articles[0].excerpt}
          className="w-full object-cover cursor-pointer hover:scale-110 transition"
        />

        <Link
          to={`/articles/${articles[0].slug}`}
          className="absolute h-[3.9rem] md:h-[4.8rem] bottom-0 left-0 flex flex-col bg-black-lighter/40 pt-1"
        >
          <ul className="hidden md:flex items-center gap-3 text-white text-xs font-semibold ml-4 hover:text-primary cursor-pointer">
            <li>{`${articles[0].author.first_name} ${articles[0].author.last_name}`}</li>
            <li>{formatDate(articles[0].publish)}</li>
          </ul>
          <h3 className="px-4 py-2 text-white text-xs font-semibold transition-all hover:text-primary cursor-pointer overflow-hidden text-ellipsis line-clamp-3">
            {articles[0].article_title}
          </h3>
        </Link>
      </div>

      <div>
        <ArticleRow article={articles[1]} />
        <ArticleRow article={articles[2]} />
        <ArticleRow article={articles[3]} />
        <ArticleRow article={articles[4]} />
      </div>
    </div>
  );
};

type GridProps = {
  article: ArticleInterface;
};

const ArticleRow = ({ article }: GridProps) => {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="w-full flex items-center justify-between gap-5 mt-4 pt-4 border-t border-primary-lightest"
    >
      <div className="w-1/2">
        <img
          src={article.featured_image_url!}
          alt={article.excerpt}
          className="w-full h-24 object-cover hover:scale-110 transition"
        />
      </div>

      <div className="w-1/2 flex flex-col gap-3">
        <ul className="hidden md:flex items-center gap-3 text-gray-400 text-xs font-semibold  hover:text-primary cursor-pointer">
          <li>{`${article.author.first_name} ${article.author.last_name}`}</li>
          <li>{formatDate(article.publish)}</li>
        </ul>

        <h3 className="text-gray-600 text-xs font-semibold transition-all hover:text-primary cursor-pointer overflow-hidden text-ellipsis md:line-clamp-3">
          {article.article_title}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryColumn;
