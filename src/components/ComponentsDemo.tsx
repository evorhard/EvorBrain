import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from './ui';

const ComponentsDemo: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [priority, setPriority] = createSignal('');
  const [agreed, setAgreed] = createSignal(false);
  const [notifications, setNotifications] = createSignal(true);
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  return (
    <div class="mx-auto max-w-4xl space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>UI Components Showcase</CardTitle>
          <CardDescription>
            A comprehensive collection of form and UI components built with Kobalte and our theme
            system.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Form Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Various input components with validation states</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              helperText="We'll never share your email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              error={
                password().length > 0 && password().length < 8
                  ? 'Password must be at least 8 characters'
                  : undefined
              }
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input size="sm" placeholder="Small input" />
            <Input size="default" placeholder="Default input" />
            <Input size="lg" placeholder="Large input" />
          </div>

          <Textarea
            label="Description"
            placeholder="Tell us more about your project..."
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            rows={4}
            helperText={`${description().length}/500 characters`}
          />

          <Select value={priority()} onChange={setPriority}>
            <SelectTrigger label="Priority Level" placeholder="Select priority" />
            <SelectPortal>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </SelectPortal>
          </Select>
        </CardContent>
      </Card>

      {/* Form Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
          <CardDescription>Checkboxes, switches, and other controls</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreed()} onChange={setAgreed} />
              <Label for="terms">I agree to the terms and conditions</Label>
            </div>

            <div class="flex items-center justify-between">
              <Label for="notifications">Enable email notifications</Label>
              <Switch id="notifications" checked={notifications()} onChange={setNotifications} />
            </div>
          </div>

          <div class="space-y-2 pt-4">
            <p class="text-content-secondary text-sm">
              Terms agreed: <span class="text-content font-medium">{agreed() ? 'Yes' : 'No'}</span>
            </p>
            <p class="text-content-secondary text-sm">
              Notifications:{' '}
              <span class="text-content font-medium">
                {notifications() ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modals & Dialogs</CardTitle>
          <CardDescription>Interactive modal components with different sizes</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <Modal open={isModalOpen()} onOpenChange={setIsModalOpen}>
              <ModalTrigger asChild>
                <Button>Open Modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Create New Task</ModalTitle>
                  <ModalDescription>
                    Add a new task to your project. Fill in the details below.
                  </ModalDescription>
                </ModalHeader>
                <div class="space-y-4 py-4">
                  <Input label="Task Name" placeholder="Enter task name" />
                  <Textarea label="Task Description" placeholder="Describe the task..." rows={3} />
                  <Select>
                    <SelectTrigger label="Assignee" placeholder="Select assignee" />
                    <SelectPortal>
                      <SelectContent>
                        <SelectItem value="john">John Doe</SelectItem>
                        <SelectItem value="jane">Jane Smith</SelectItem>
                        <SelectItem value="bob">Bob Johnson</SelectItem>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </div>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>Create Task</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal>
              <ModalTrigger asChild>
                <Button variant="secondary">Small Modal</Button>
              </ModalTrigger>
              <ModalContent size="sm">
                <ModalHeader>
                  <ModalTitle>Confirm Action</ModalTitle>
                  <ModalDescription>
                    Are you sure you want to proceed with this action?
                  </ModalDescription>
                </ModalHeader>
                <ModalFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal>
              <ModalTrigger asChild>
                <Button variant="outline">Large Modal</Button>
              </ModalTrigger>
              <ModalContent size="lg">
                <ModalHeader>
                  <ModalTitle>Project Overview</ModalTitle>
                  <ModalDescription>View and manage your project details</ModalDescription>
                </ModalHeader>
                <div class="py-4">
                  <p class="text-content">
                    This is a large modal that can contain more complex content, forms, or detailed
                    information about your project.
                  </p>
                </div>
                <ModalFooter>
                  <Button>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <div class="space-y-4">
        <h2 class="text-content text-2xl font-bold">Card Variants</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>With shadow and border</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-content text-sm">This is the default card style with shadow.</p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader>
              <CardTitle>Outline Card</CardTitle>
              <CardDescription>Border only, no shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-content text-sm">A simpler card with just a border.</p>
            </CardContent>
          </Card>

          <Card variant="ghost">
            <CardHeader>
              <CardTitle>Ghost Card</CardTitle>
              <CardDescription>No border or shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-content text-sm">Minimal card style for subtle content.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Form Example</CardTitle>
          <CardDescription>
            A full form demonstrating all components working together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input label="First Name" placeholder="John" required />
              <Input label="Last Name" placeholder="Doe" required />
            </div>

            <Input label="Email" type="email" placeholder="john.doe@example.com" required />

            <Select>
              <SelectTrigger label="Department" placeholder="Select your department" />
              <SelectPortal>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>

            <Textarea
              label="Additional Information"
              placeholder="Tell us about yourself..."
              rows={4}
            />

            <div class="space-y-4">
              <Checkbox label="Subscribe to newsletter" />
              <Switch label="Make profile public" />
            </div>

            <CardFooter class="px-0 pt-6">
              <Button type="button" variant="outline" class="mr-2">
                Cancel
              </Button>
              <Button type="submit">Submit Form</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentsDemo;
