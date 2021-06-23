import { Flex, Heading } from '@chakra-ui/react'

export const Hero = ({ title, children }: { title: string, children: any }) => (
  <Flex justifyContent="center" alignItems="center" height="100vh" flexDirection="column" maxWidth="90%">
    <Heading fontSize="6vw">{title}</Heading>
    { children }
  </Flex>
)

Hero.defaultProps = {
  title: 'Ethereum FOMO Club',
}