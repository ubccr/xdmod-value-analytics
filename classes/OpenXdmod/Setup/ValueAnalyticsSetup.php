<?php

namespace OpenXdmod\Setup;

/**
 * Sub-menu for Value Analytics setup.
 */
class ValueAnalyticsSetup extends SubMenuSetupItem
{
    /**
     * This setup menu.
     *
     * @var Menu
     */
    protected $menu;

    /**
     * True if setup should quit.
     *
     * @var bool
     */
    protected $quit;

    /**
     * @inheritdoc
     */
    public function __construct(Console $console)
    {
        parent::__construct($console);

        $items = array(
            new MenuItem('d', 'Setup Database', new ValueAnalyticsDbSetup($console)),
            new MenuItem('p', 'Patch Open XDMoD', new ValueAnalyticsPatchSetup($console)),
            new MenuItem('q', 'Quit Value Analytics Setup', new SubMenuQuitSetup($console, $this)),
        );

        $this->menu = new Menu($items, $this->console, 'Value Analytics Module Setup');
    }

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $this->quit = false;

        while (!$this->quit) {
            $this->menu->display();
        }
    }

    /**
     * Call to exit the menu on the next cycle.
     */
    public function quit()
    {
        $this->quit = true;
    }

    /**
     * No options to save data for this submenu
     */
    public function save()
    {
    }
}
