import { FaFacebook, FaInstagram, FaX, FaYoutube } from "react-icons/fa6";

const SocialsWidget = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="hidden md:flex flex-col border-t-2 border-primary py-4">
        <h2 className="text-primary text-base font-bold uppercase mb-3">
          Stay Connected
        </h2>

        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <a href="http://" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center justify-between w-full h-10 py-2 px-4 text-base font-semibold border bg-primary rounded-md">
              <FaFacebook /> {"Facebook"}
            </button>
          </a>
          <a href="http://" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center justify-between w-full h-10 py-2 px-4 text-base font-semibold border bg-green-500 text-white rounded-md">
              <FaInstagram /> {"Instagram"}
            </button>
          </a>
          <a href="http://" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center justify-between w-full h-10 py-2 px-4 text-base font-semibold border bg-red-500 text-white rounded-md">
              <FaYoutube /> {"Youtube"}
            </button>
          </a>
          <a href="http://" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center justify-between w-full h-10 py-2 px-4 text-base font-semibold border bg-amber-500 rounded-md">
              <FaX /> {"x"}
            </button>
          </a>
        </div>
      </div>

      <div className="py-7 px-4 bg-white text-center">
        <a
          href="https://play.google.com/store/apps/details?id=com.tisini.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://i.postimg.cc/7YHmZGt2/tisini-App.gif"
            alt="livescores"
            className="w-full h-72 cursor-pointer"
          />
        </a>
      </div>
    </div>
  );
};

export default SocialsWidget;
