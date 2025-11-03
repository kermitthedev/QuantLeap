import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  parameters: any;
  result: any;
  greeks?: any;
}

export default function SocialShare({ parameters, result, greeks }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const { spotPrice, strikePrice, volatility, optionType } = parameters;
    const price = result?.price?.toFixed(2) || '0.00';
    const delta = greeks?.delta?.toFixed(2) || '0.00';
    
    return `📊 Options Analysis:\n\n${optionType.toUpperCase()} Option\nStrike: $${strikePrice}\nSpot: $${spotPrice}\nIV: ${(volatility * 100).toFixed(0)}%\n\nFair Value: $${price}\nDelta: ${delta}\n\n#Options #Trading #QuantFinance`;
  };

  const shareURL = window.location.href;
  const shareText = generateShareText();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareURL)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyAnalysis = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Analysis copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy analysis');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-2 text-sm">Preview</h4>
            <pre className="text-xs whitespace-pre-wrap font-mono">{shareText}</pre>
          </Card>

          {/* Share URL */}
          <div>
            <label className="text-sm font-medium mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <Input value={shareURL} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleTwitterShare}
              className="gap-2"
            >
              <Twitter className="h-4 w-4" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              onClick={handleLinkedInShare}
              className="gap-2"
            >
              <Linkedin className="h-4 w-4" />
              Share on LinkedIn
            </Button>
          </div>

          <Button
            variant="secondary"
            onClick={handleCopyAnalysis}
            className="w-full gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Analysis Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
