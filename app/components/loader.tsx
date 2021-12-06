export default function Loader() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-600 h-12 w-12"></div>
      <p className="text-primary pt-3">
        Bringing in more content...
      </p>
    </div>
  );
}
