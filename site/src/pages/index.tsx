import {
  Link as ChakraLink,
  Text,
  Flex,
  Popover, PopoverContent, PopoverTrigger,
  FormErrorMessage,
  FormControl,
  FormLabel,
  Button,
  Badge, ButtonGroup,
  Input, InputGroup, InputLeftElement, InputRightElement
} from '@chakra-ui/react'
import { LinkIcon, CalendarIcon } from '@chakra-ui/icons'
import Head from 'next/head'
import { DayPicker, useInput, UseInputOptions } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { css } from "@emotion/react";


import { Hero } from '../components/Hero'
import { Container } from '../components/Container'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { Formik, Field, Form } from "formik";
import { useState } from 'react'

async function API(ts) {
  // Format - https://api.coinbase.com/v2/prices/ETH-USD/spot?date=YYYY-MM-DD
  const then = await fetch(`https://api.coinbase.com/v2/prices/ETH-USD/spot?date=${ts}`).then(res => res.json())
  const d = new Date();
  const offset = d.getTimezoneOffset()
  const actualDate = new Date(d.getTime() - (offset*60*1000))
  const newTs = (actualDate.toISOString().split('T')[0])
  const today = await fetch(`https://api.coinbase.com/v2/prices/ETH-USD/spot?date=${newTs}`).then(res => res.json())
  return ({ then: then.data, today: today.data })
}

const options: UseInputOptions = {
  // Select today as default
  defaultSelected: new Date(),
  // Limit the valid dates
  fromYear: 2015,
  toYear: 2021,
  format: "P",
  // Make the selection mandatory.
  required: true
};

const Index = () => {
  const [ts, setTs] = useState(new Date());
  const [amount, setAmount] = useState(undefined);
  const [moneyz, setMoneyz] = useState(0);
  const input = useInput(options);

  function validateAmount(value: string) {
    console.log('value', value)
    let error
    if (!value) {
      error = "Give me some amount to calculate."
    } else {
      try {
        if (isNaN(parseInt(value))) {
          throw Error('Needs to be a number')
        }
      } catch (err) {
        error = "Needs to be an actual number."
      }
    }
    return error
  }

  const handleClick = (time: 'year' | 'month') => {
    const d = new Date();
    if (time == 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setFullYear(d.getFullYear() - 1);
    }
    const offset = d.getTimezoneOffset()
    const actualDate = new Date(d.getTime() - (offset*60*1000))
    setTs(actualDate)
  }

  return (
    <Container height="100vh" css={css`
    --rdp-cell-size: 2rem;
    --rdp-accent-color: var(--chakra-colors-blue-500);
    --rdp-background-color: var(--chakra-colors-blue-200);
  `}>
      <Head>
        <title>Ethereum FOMO Club</title>
        <link rel="icon" href="favicon.ico" />
      </Head>

      <Hero>
        <Text>
          How much you would had have if you had bought <ChakraLink
            isExternal
            href="https://ethereum.org/"
            flexGrow={1}
            mr={2}
          >
            Ethereum <LinkIcon /> then?
          </ChakraLink>
        </Text>
        <br />
        <Formik
          initialValues={{ amount: amount, ts: ts }}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(async () => {
              const { ts, amount } = values;
              const actualTs = ts.toISOString().split('T')[0]

              const response = await API(actualTs);

              console.log("Response", response);
              setMoneyz(amount/response.then.amount * response.today.amount)
              actions.setSubmitting(false)
            }, 0)
          }}
        >
          {(props) => (
            <Form style={{ width: '100%' }}>
              <Field name="amount" validate={validateAmount}>
                {({ field, form }: { field: any, form: any }) => (
                  <FormControl isInvalid={form.errors.amount && form.touched.amount}>
                    <FormLabel htmlFor="amount">If I had bought </FormLabel>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.300"
                        fontSize="1.2em"
                        children="$"
                      />
                      <Input placeholder="1000" {...field} id="amount" value={form.values.amount} />
                      <InputRightElement width="11rem" mr="5px">
                        <ButtonGroup size="sm" isAttached>
                          <Button h="1.75rem" size="sm" onClick={() => setAmount(10)}>
                            $10
                          </Button>
                          <Button h="1.75rem" size="sm" onClick={() => setAmount(100)}>
                            $100
                          </Button>
                          <Button h="1.75rem" size="sm" onClick={() => setAmount(1000)}>
                            $1000
                          </Button>
                        </ButtonGroup>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{form.errors.amount}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="timestamp">
                {({ field, form }: { field: any, form: any }) => (
                  <FormControl isInvalid={form.errors.timestamp && form.touched.timestamp}>
                    <FormLabel mt="10px" htmlFor="timestamp">on the </FormLabel>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.300"
                        fontSize="1.2em"
                        children={<CalendarIcon />}
                      />
                      <Popover>
                        <PopoverTrigger>
                          <Input pl="2.5rem" {...input.fieldProps} value={format(ts, options.format)} id="ts" placeholder={format(form.values.ts, options.format)} />
                        </PopoverTrigger>
                        <PopoverContent>
                          <DayPicker {...input.dayPickerProps} mode="single" onSelect={setTs} />
                        </PopoverContent>
                      </Popover>                      
                      <InputRightElement width="12.5rem" mr="5px">
                        <ButtonGroup size="sm" isAttached>
                          <Button h="1.75rem" size="sm" onClick={() => handleClick('year')}>
                            1 year ago
                          </Button>
                          <Button h="1.75rem" size="sm" onClick={() => handleClick('month')}>
                            1 month ago
                          </Button>
                        </ButtonGroup>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{form.errors.timestamp}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Text mt="10px">you would have now <Badge colorScheme="green">{
                moneyz == 0 ? '$ USD' : `$ ${moneyz.toFixed(2)} USD`
              }</Badge></Text>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={props.isSubmitting}
                type="submit"
              >
                Calculate
          </Button>
            </Form>
          )}
        </Formik>

      </Hero>
      <DarkModeSwitch />
      <Flex as="footer" pt="4rem" pb="2rem" maxWidth="80%" textAlign="center">
        <Text>By <ChakraLink textDecoration="underline" isExternal href="https://jjperezaguinaga.com/" flexGrow={1}>Jose Aguinaga</ChakraLink>, for the <ChakraLink textDecoration="underline" isExternal href="https://kernel.community/en/" flexGrow={1}>KERNEL Community</ChakraLink>, hosted by our friends at <ChakraLink textDecoration="underline" isExternal href="https://fleek.co/" flexGrow={1}>Fleek</ChakraLink> using <ChakraLink textDecoration="underline" isExternal href="https://ipfs.io" flexGrow={1}>IPFS</ChakraLink></Text>
      </Flex>
    </Container>
  )
}

export default Index