<?php

namespace OpenXdmod\Setup;

/**
 * Applies patches to Open XDMoD for the Value Analytics module.
 */
class ValueAnalyticsApplyPatchesSetup extends SetupItem
{
    /**
     * Options for this setup action.
     *
     * @var array
     */
    private $options;

    /**
     * @inheritdoc
     */
    public function __construct(Console $console, array $options = array())
    {
        parent::__construct($console);

        $this->options = $options;
    }

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $this->console->displaySectionHeader('Value Analytics Patches for Open XDMoD');

        $isReversing = \xd_utilities\array_get($this->options, 'reverse', false);
        $directionOption = (
            $isReversing
            ? '--reverse'
            : '--forward'
        );
        $patchingAction = (
            $isReversing
            ? 'Reversing'
            : 'Applying'
        );

        $this->console->displayMessage("$patchingAction Value Analytics patches to Open XDMoD...");
        $this->console->displayBlankLine();

        $patchesToTargets = array(
            'value-analytics/classes/OpenXdmod/DataWarehouseInitializer.php.patch' => (
                DATA_DIR . '/classes/OpenXdmod/DataWarehouseInitializer.php'
            ),
        );
        foreach ($patchesToTargets as $patchPathInDir => $targetPath) {
            $patchPath = DATA_DIR . '/patches/' . $patchPathInDir;

            $this->console->displayMessage("Patching $targetPath...");
            $this->executeCommand("patch --quiet $directionOption $targetPath $patchPath");
        }

        $this->console->displayBlankLine();
        $this->console->displayMessage("Patching completed.");
        $this->console->displayBlankLine();

        $this->console->prompt('Press ENTER to continue.');

        $callback = \xd_utilities\array_get($this->options, 'callback');
        if ($callback !== null) {
            call_user_func($callback);
        }
    }
}
