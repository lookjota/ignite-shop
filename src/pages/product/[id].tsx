import { stripe } from "@/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"
import axios from "axios"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { useState } from "react"
// import { useRouter } from "next/router"
import Stripe from "stripe"

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) { 

  const [isCreatingCheckoutSession, setIsCreatingCkeckoutSession] = useState(false)

  // se for direcionar o usuario para uma checkout de pagina interna
  // da nossa aplication 
  // const router = useRouter()

  async function handleBuyProduct() {
    try {
      setIsCreatingCkeckoutSession(true)

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data;

      // router.push('/checkout')

      window.location.href = checkoutUrl

    } catch (err) {
      // Conectar com uma ferramenta de observabilidade (datadog / sentry )
      setIsCreatingCkeckoutSession(false)

      alert('falha ao redirecionar ao checkout!')
    } 
  }

  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>Loading...</p>
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />

          <ProductDetails>
            <h1>{product.name}</h1>
            <span>{product.price}</span>

            <p>{product.description}</p>

            <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
              Comprar agora
            </button>
          </ProductDetails>
        </ImageContainer>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    // carrega aqui os produdos mais acessados
    // ou posts mais acessadois
    paths: [
      { params: { id: 'prod_NiK330yNZnRkAj'} }
    ],
    fallback: true,
    // fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {

  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
  
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}