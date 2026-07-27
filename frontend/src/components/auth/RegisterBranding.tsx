const RegisterBranding = () => {
  return (
    <div className='hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 to-blue-900 text-white p-12 relative overflow-hidden'>
      <div />
      <div>
        <h2 className='text-3xl font-semibold leading-snug mb-6'>
          Schedule once,
          <br />
          publish everywhere.
        </h2>
        <div className='border-l-2 border-blue-400 pl-4'>
          <p className='text-blue-100 text-sm leading-relaxed mb-4'>
            "Switching to SocialAuto saved our team hours every week. Everything
            from drafts to analytics in one dashboard."
          </p>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full bg-blue-400/30 flex items-center justify-center text-sm font-medium'>
              AK
            </div>
            <div>
              <p className='text-sm font-medium'>Arjun Kapoor</p>
              <p className='text-xs text-blue-200'>Founder at Loomly Labs</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className='text-xs text-blue-200 uppercase tracking-wide mb-4'>
          Connect with all major platforms
        </p>
        <div className='flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100 font-medium'>
          <span>Twitter / X</span>
          <span>Instagram</span>
          <span>LinkedIn</span>
          <span>Facebook</span>
          <span>TikTok</span>
          <span>YouTube</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterBranding;
