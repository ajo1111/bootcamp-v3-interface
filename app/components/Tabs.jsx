function Tabs({ tabs, setCondition }) {

  function tabHandler(e, tabs) {
    /*
      This assumes we have 2 tabs.

      If the selected tab equals the 1st tab
      Then set the 2nd tab to not be active

      Else, the selected tab is the 2nd tab
      Then set the 1st tab to not be active

      Regardless, set the selected tab to be active
    */

    if (e.target.className === tabs[0].ref.current.className) {
      tabs[1].ref.current.className = 'tab'
      setCondition(true)
    } else {
      tabs[0].ref.current.className = 'tab'
      setCondition(false)
    }

    e.target.className = 'tab tab--active'
  }

  return (
    <div className='tabs'>
      {tabs && tabs.map((tab, index) => (
        <button
          key={index}
          onClick={(e) => tabHandler(e, tabs)}
          ref={tab.ref}
          className={`tab ${tab.default && "tab--active"}`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
