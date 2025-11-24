'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FooterDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms' | null;
}

export function FooterDialogContent({ isOpen, onClose, contentType }: FooterDialogContentProps) {
  // Define content based on the type
  const getContent = () => {
    switch (contentType) {
      case 'contact':
        return {
          title: 'Contact Us',
          description: 'Get in touch with our team for support and inquiries.'
        };
      case 'about':
        return {
          title: 'About Us',
          description: 'Learn more about our mission to promote fire safety education.'
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          description: 'Find answers to common questions about our platform and services.'
        };
      case 'report':
        return {
          title: 'Report an Issue',
          description: 'Report any issues or problems with our platform.'
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          description: 'Our commitment to protecting your privacy and personal information.'
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          description: 'Terms and conditions for using our platform.'
        };
      default:
        return {
          title: '',
          description: ''
        };
    }
  };

  const { title, description } = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {contentType === 'contact' && (
            <div className="space-y-4">
              <p>For general inquiries, please reach out to us:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Email:</span>
                  <span>stacruzfire@yahoo.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>0967 052 8897</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Address:</span>
                  <span>Bureau of Fire Protection, Sta. Cruz, Laguna</span>
                </li>
              </ul>
            </div>
          )}
          {contentType === 'about' && (
            <div className="space-y-4">
              <p>The BFP Berong platform is an educational initiative by the Bureau of Fire Protection Sta. Cruz, Laguna.</p>
              <p>Our mission is to provide comprehensive fire safety education to different sectors of the community through interactive and engaging content.</p>
              <p>We aim to reduce fire-related incidents by increasing awareness and preparedness among citizens of all ages.</p>
            </div>
          )}
          {contentType === 'faq' && (
            <div className="space-y-4">
              <div className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-semibold">How can I access the professional content?</h4>
                <p className="pt-1 text-sm text-muted-foreground">Professional content is available to verified BFP personnel and certified fire safety professionals.</p>
              </div>
              <div className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-semibold">Is this platform free to use?</h4>
                <p className="pt-1 text-sm text-muted-foreground">Yes, our platform is completely free to use for educational purposes.</p>
              </div>
              <div className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-semibold">How often is the content updated?</h4>
                <p className="pt-1 text-sm text-muted-foreground">Our content is regularly updated to reflect the latest fire safety regulations and best practices.</p>
              </div>
            </div>
          )}
          {contentType === 'report' && (
            <div className="space-y-4">
              <p>If you encounter any issues with our platform, please report them using our contact:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Technical problems or bugs</p>
                <p>• Inaccurate information</p>
                <p>• Content suggestions</p>
                <p>• Accessibility concerns</p>
              </div>
              <p className="pt-2">We will review all reports and respond as soon as possible.</p>
            </div>
          )}
          {contentType === 'privacy' && (
            <div className="space-y-4 text-sm">
              <p>At BFP Berong, we are committed to protecting your privacy and safeguarding your personal information.</p>
              <h4 className="font-semibold pt-2">Information We Collect</h4>
              <p>We collect information necessary to provide you with the best educational experience, including account information and learning progress.</p>
              <h4 className="font-semibold pt-2">How We Use Your Information</h4>
              <p>Your information is used solely for educational purposes and to improve our platform's content and functionality.</p>
              <h4 className="font-semibold pt-2">Data Security</h4>
              <p>We implement appropriate security measures to protect your information against unauthorized access or alteration.</p>
            </div>
          )}
          {contentType === 'terms' && (
            <div className="space-y-4 text-sm">
              <p>These terms govern your use of the BFP Berong educational platform.</p>
              <h4 className="font-semibold pt-2">Acceptable Use</h4>
              <p>You agree to use this platform for educational purposes only and not to distribute harmful or inappropriate content.</p>
              <h4 className="font-semibold pt-2">Content Ownership</h4>
              <p>All educational content is owned by the Bureau of Fire Protection Sta.Cruz Laguna and is provided for educational purposes.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
