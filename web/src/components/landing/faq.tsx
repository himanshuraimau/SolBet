import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does SolBet determine the outcome of bets?",
    answer:
      "SolBet uses a combination of verified data sources and oracle services to determine bet outcomes. For certain categories like sports and weather, we integrate with established data providers. For more subjective bets, a decentralized voting mechanism allows verified users to participate in outcome resolution.",
  },
  {
    question: "What fees does SolBet charge?",
    answer:
      "SolBet charges a 2% fee on the total pool size when a bet is resolved. This fee is used to maintain the platform, improve security, and fund the development of new features. There are no hidden fees or charges.",
  },
  {
    question: "Can I create a private bet for just my friends?",
    answer:
      "Yes! When creating a bet, you can set it as 'private' and provide wallet addresses that are allowed to participate. Only those addresses will be able to view and join your bet.",
  },
  {
    question: "What happens if a bet cannot be clearly resolved?",
    answer:
      "In rare cases where a bet outcome cannot be clearly determined, SolBet will initiate a 'dispute resolution' process. This involves a community vote and review by our resolution committee. If a consensus cannot be reached, the bet will be canceled and all participants will receive their original wagers back.",
  },
  {
    question: "Is SolBet available worldwide?",
    answer:
      "SolBet is a decentralized platform accessible to anyone with a Solana wallet. However, users are responsible for ensuring they comply with their local laws and regulations regarding betting and cryptocurrency use.",
  },
  {
    question: "How secure is SolBet?",
    answer:
      "SolBet's smart contracts have undergone multiple security audits by leading blockchain security firms. All bet pools are held in secure escrow contracts until resolution. We never take custody of user funds beyond what is explicitly wagered.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Everything you need to know about SolBet.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-heading text-lg">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
