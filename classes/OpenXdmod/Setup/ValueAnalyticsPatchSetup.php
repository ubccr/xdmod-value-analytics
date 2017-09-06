<?php

namespace OpenXdmod\Setup;

/**
 * Sub-menu for applying patches to Open XDMoD for the Value Analytics module.
 */
class ValueAnalyticsPatchSetup extends SubMenuSetupItem
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

        $quitCallback = array($this, 'quit');
        $items = array(
            new MenuItem('a', 'Apply patches to Open XDMoD', new ValueAnalyticsApplyPatchesSetup($console, array(
                'callback' => $quitCallback,
            ))),
            new MenuItem('r', 'Reverse patches to Open XDMoD', new ValueAnalyticsApplyPatchesSetup($console, array(
                'reverse' => true,
                'callback' => $quitCallback,
            ))),
            new MenuItem('q', 'Quit without patching', new SubMenuQuitSetup($console, $this)),
        );

        $this->menu = new Menu($items, $this->console, 'Value Analytics Patches for Open XDMoD');
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
