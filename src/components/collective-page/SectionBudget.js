import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import { Flex, Box } from '@rebass/grid';
import { filter, orderBy } from 'lodash';

import { formatCurrency } from '../../lib/utils';
import { H3, P, Span } from '../Text';
import Container from '../Container';
import StyledButton from '../StyledButton';
import StyledCard from '../StyledCard';
import Link from '../Link';
import DebitCreditList, { DebitItem, CreditItem } from '../DebitCreditList';
import DefinedTerm, { Terms } from '../DefinedTerm';
import LinkCollective from '../LinkCollective';
import Avatar from '../Avatar';

import ContainerSectionContent from './ContainerSectionContent';

/**
 * The budget section. Shows the expenses, the latests transactions and some statistics
 * abut the global budget of the collective.
 */
const SectionBudget = ({ collective, transactions, expenses, stats, intl }) => {
  // Merge items, filter expenses that already have a transaction as they'll already be
  // included in `transactions`.
  const unpaidExpenses = filter(expenses, e => !e.transaction);
  const allItems = orderBy([...transactions, ...unpaidExpenses], i => new Date(i.createdAt), ['desc']).slice(0, 3);

  return (
    <ContainerSectionContent py={6}>
      <H3 mb={3} fontSize={['H4', 'H2']} fontWeight="normal" color="black.900">
        <FormattedMessage id="CollectivePage.SectionBudget.Title" defaultMessage="Latest transactions" />
      </H3>
      <P color="black.600" mb={4} maxWidth={830}>
        <FormattedMessage
          id="CollectivePage.SectionBudget.Description"
          defaultMessage="See how money openly circulates through {collectiveName}. All contributions and all expenses are published in our transparent public ledger. Learn who is donating, how much, where is that money going, submit expenses, get reinmbursed and more!"
          values={{ collectiveName: collective.name }}
        />
      </P>
      <Flex flexDirection={['column-reverse', null, 'row']} justifyContent="space-between" alignItems="flex-start">
        {transactions && (
          <Container flex="10" mb={3} width="100%" maxWidth={800}>
            <DebitCreditList>
              {allItems.map(item => {
                const { __typename, id, type, fromCollective, description, createdAt } = item;
                const isExpense = __typename === 'ExpenseType';
                const isCredit = type === 'CREDIT';
                const ItemContainer = isExpense || !isCredit ? DebitItem : CreditItem;
                const amount = isExpense ? item.amount : item.netAmountInCollectiveCurrency;
                const currency = collective.currency;

                return (
                  <ItemContainer key={`${__typename}_${id}`}>
                    <Container p={24} display="flex" justifyContent="space-between">
                      <Flex>
                        <Box mr={3}>
                          <Avatar
                            src={fromCollective.image}
                            type={fromCollective.type}
                            name={fromCollective.name}
                            radius={40}
                          />
                        </Box>
                        <Flex flexDirection="column" justifyContent="space-between">
                          <P color="black.900" fontWeight="600">
                            {description}
                          </P>
                          <P color="black.500">
                            {item.usingVirtualCardFromCollective ? (
                              <FormattedMessage
                                id="Transactions.byWithGiftCard"
                                defaultMessage="by {collectiveName} with {collectiveGiftCardName} {giftCard} on {date}"
                                values={{
                                  collectiveName: <LinkCollective collective={fromCollective} />,
                                  date: <FormattedDate value={createdAt} weekday="long" day="numeric" month="long" />,
                                  collectiveGiftCardName: item.usingVirtualCardFromCollective.name,
                                  giftCard: (
                                    <DefinedTerm term={Terms.GIFT_CARD} termTextTransform="lowercase" intl={intl} />
                                  ),
                                }}
                              />
                            ) : (
                              <FormattedMessage
                                id="Transactions.by"
                                defaultMessage="by {collectiveName} on {date}"
                                values={{
                                  collectiveName: <LinkCollective collective={fromCollective} />,
                                  date: <FormattedDate value={createdAt} weekday="long" day="numeric" month="long" />,
                                }}
                              />
                            )}
                          </P>
                        </Flex>
                      </Flex>
                      <P fontSize="LeadParagraph">
                        {isCredit ? (
                          <Span color="green.700" mr={2}>
                            +
                          </Span>
                        ) : (
                          <Span color="red.700" mr={2}>
                            −
                          </Span>
                        )}
                        <Span fontWeight="bold" mr={1}>
                          {formatCurrency(Math.abs(amount), currency)}
                        </Span>
                        <Span color="black.400" textTransform="uppercase">
                          {currency}
                        </Span>
                      </P>
                    </Container>
                  </ItemContainer>
                );
              })}
            </DebitCreditList>
          </Container>
        )}

        <Box width="32px" flex="1" />

        <StyledCard
          display="flex"
          flex="1"
          width="100%"
          flexDirection={['column', 'row', 'column']}
          mb={2}
          minWidth={300}
        >
          <Box flex="1" py={16} px={24}>
            <P fontSize="Tiny" textTransform="uppercase" color="black.700">
              <FormattedMessage id="CollectivePage.SectionBudget.Balance" defaultMessage="Today’s balance" />
            </P>
            <P fontSize="H5" mt={1} mb={3}>
              {formatCurrency(stats.balance, collective.currency)} <Span color="black.400">{collective.currency}</Span>
            </P>
            <Link route="createExpense" params={{ collectiveSlug: collective.slug }}>
              <StyledButton buttonSize="small" fontWeight="bold" py={2} px={3}>
                <FormattedMessage id="CollectivePage.SectionBudget.SubmitExpense" defaultMessage="Submit Expenses" /> →
              </StyledButton>
            </Link>
          </Box>
          <Container flex="1" background="#F5F7FA" py={16} px={24}>
            <P fontSize="Tiny" textTransform="uppercase" color="black.700">
              <FormattedMessage id="CollectivePage.SectionBudget.Annual" defaultMessage="Estimated annual budget" />
            </P>
            <P fontSize="H5" mt={1}>
              <Span fontWeight="bold">~ {formatCurrency(stats.yearlyBudget, collective.currency)}</Span>{' '}
              <Span color="black.400">{collective.currency}</Span>
            </P>
          </Container>
        </StyledCard>
      </Flex>
      <Link route="transactions" params={{ collectiveSlug: collective.slug }}>
        <StyledButton buttonSize="large" mt={3} width={1}>
          <FormattedMessage id="CollectivePage.SectionBudget.ViewAll" defaultMessage="View all transactions" /> →
        </StyledButton>
      </Link>
    </ContainerSectionContent>
  );
};

SectionBudget.propTypes = {
  /** Collective */
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
  }),

  /** Stats */
  stats: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    yearlyBudget: PropTypes.number.isRequired,
  }),

  /** Transactions */
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      netAmountInCollectiveCurrency: PropTypes.number,
      type: PropTypes.oneOf(['CREDIT', 'DEBIT']),
      usingVirtualCardFromCollective: PropTypes.shape({
        id: PropTypes.number,
        slug: PropTypes.string,
        name: PropTypes.string,
      }),
      fromCollective: PropTypes.shape({
        id: PropTypes.number,
        slug: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
  ),

  /** Expenses */
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      transaction: PropTypes.shape({
        id: PropTypes.number,
      }),
      fromCollective: PropTypes.shape({
        id: PropTypes.number,
        slug: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ),

  /** @ignore from injectIntl */
  intl: PropTypes.object,
};

export default injectIntl(SectionBudget);