<?php

namespace OpenXdmod\Setup;

/**
 * Database setup for the Value Analytics module.
 */
class ValueAnalyticsDbSetup extends DatabaseSetupItem
{
    /**
     * @inheritdoc
     */
    public function handle()
    {
        $settings = $this->loadIniConfig('portal_settings');

        $this->console->displaySectionHeader('Value Analytics Database Setup');

        $this->console->displayMessage(<<<"EOT"
Value Analytics for Open XDMoD requires one additional database schema to be
added to the MySQL database. The schema must be named modw_value_analytics. It
will reuse the existing database credentials from your Open XDMoD instance.
EOT
        );
        $this->console->displayBlankLine();

        $this->console->displayMessage(<<<"EOT"
Please provide the password for the administrative account that will be
used to create the databases.
EOT
        );
        $this->console->displayBlankLine();

        $adminUsername = $this->console->prompt(
            'DB Admin Username:',
            'root'
        );

        $adminPassword = $this->console->silentPrompt(
            'DB Admin Password:'
        );

        try {
            // The Value Analytics schema reuses configuration sections from
            // the primary portal_settings.ini file - namely, the
            // "datawarehouse" section.
            $sectionForDatabase = array(
                'modw_value_analytics' => 'datawarehouse',
            );

            foreach ($sectionForDatabase as $database => $section) {
                $dbSettings = array(
                    'db_host' => $settings[$section . '_host'],
                    'db_port' => $settings[$section . '_port'],
                    'db_user' => $settings[$section . '_user'],
                    'db_pass' => $settings[$section . '_pass'],
                );

                $this->createDatabases(
                    $adminUsername,
                    $adminPassword,
                    $dbSettings,
                    array($database)
                );
            }
        } catch (Exception $e) {
            $this->console->displayBlankLine();
            $this->console->displayMessage('Failed to create databases:');
            $this->console->displayBlankLine();
            $this->console->displayMessage($e->getMessage());
            $this->console->displayBlankLine();
            $this->console->displayMessage($e->getTraceAsString());
            $this->console->displayBlankLine();
            $this->console->displayMessage('Settings file not saved!');
            $this->console->displayBlankLine();
            $this->console->prompt('Press ENTER to continue.');
            return;
        }

        $this->console->displayBlankLine();
        $this->console->prompt('Press ENTER to continue.');
    }
}
