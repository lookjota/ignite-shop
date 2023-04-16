import { stripe } from "@/lib/stripe";
import { ImageContainer } from "@/styles/pages/product";
import { SuccessContainer } from "@/styles/pages/success";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";
import Stripe from "stripe";

interface SuccessProps {
  customerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}

export default function Success({ customerName, product }: SuccessProps) {
  return (
    <>
      <Head>
        <title>Compra efetuada | Ignite Shop</title>
        <meta name="robots" content="noindex"/>
      </Head>
      <SuccessContainer>
        <h1>Compra Efetuada!</h1>

        <ImageContainer>
          <Image src={product.imageUrl} width={120} height={110} alt=""/>
        </ImageContainer>

        <p>
          uhuull <strong>{customerName}</strong>, sua <strong>{product.name} </strong> ja esta a caminho da sua casa
        </p>

        <Link href="/">
          Voltar ao catalogo
        </Link>
      </SuccessContainer>
    </>
  )
} 

export const getServerSideProps: GetServerSideProps = async ({ query }) => {

  if (!query.session_Id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  })

  const customerName = session.customer_details.name;
  const product = session.line_items.data[0].price.product as Stripe.Product
  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0],
      }
    }
  }
}
