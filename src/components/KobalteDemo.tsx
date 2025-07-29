import { Component, createSignal } from "solid-js";
import { 
  Button, 
  Checkbox, 
  Switch, 
  Tooltip,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui";
import { HiOutlineDotsVertical } from "solid-icons/hi";

const KobalteDemo: Component = () => {
  const [switchChecked, setSwitchChecked] = createSignal(false);
  const [checkboxChecked, setCheckboxChecked] = createSignal(false);

  return (
    <div class="p-8 space-y-8">
      <div class="bg-surface rounded-lg shadow-card p-6">
        <h2 class="text-2xl font-bold text-content mb-4">Kobalte Component Library</h2>
        <p class="text-content-secondary mb-6">
          A collection of accessible, unstyled components integrated with our theme system.
        </p>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Buttons</h3>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <HiOutlineDotsVertical class="h-4 w-4" />
            </Button>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Form Controls</h3>
        <div class="space-y-4">
          <div>
            <Switch
              label="Enable notifications"
              checked={switchChecked()}
              onChange={setSwitchChecked}
            />
          </div>
          
          <div>
            <Checkbox
              label="I agree to the terms and conditions"
              checked={checkboxChecked()}
              onChange={setCheckboxChecked}
            />
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Tooltips</h3>
        <div class="flex gap-4">
          <Tooltip content="This is a tooltip">
            <Button variant="outline">Hover me</Button>
          </Tooltip>
          
          <Tooltip content="Another helpful tooltip" placement="bottom">
            <Button variant="secondary">Bottom tooltip</Button>
          </Tooltip>
          
          <Tooltip content="Right side tooltip" placement="right">
            <Button variant="ghost">Right tooltip</Button>
          </Tooltip>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Dropdown Menu</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Open Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Component States</h3>
        <p class="text-content-secondary mb-4">
          Current states:
        </p>
        <ul class="space-y-2 text-sm">
          <li class="text-content">
            Switch: <span class="font-medium">{switchChecked() ? "On" : "Off"}</span>
          </li>
          <li class="text-content">
            Checkbox: <span class="font-medium">{checkboxChecked() ? "Checked" : "Unchecked"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default KobalteDemo;