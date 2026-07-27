const Spinner = ({ size = 20 }: { size?: number }) => {
  return (
    <div
      className='border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin'
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
