import React, { Component } from 'react';
import {connect} from 'react-redux';

import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
//VAŽNO: pošto je ime file kojeg uvozimo index.js da samo stavili ../../store/actions import bi još funkcionirao jer bi automtakis u tom folderu actions izbarao index.js
import * as actions from '../../store/actions/index';
import axios from '../../axios-orders';

class BurgerBuilder extends Component {

    state={
            purchasing: false,
           
        }

    componentDidMount() {
        // console.log(' BurgerBuilder.js-this.props',this.props);
        this.props.onInitIngredients()
    }    
   
    updatePurchaseState(ingredients) {
      
     const sum=Object.keys(ingredients)
        .map(igKey=>{
            return ingredients[igKey]
        })
        .reduce((sum,el)=>{
          return sum + el
        },0)
        return sum > 0
    }    
    
    purchaseHandler= ()=> {
       this.setState({purchasing: true})
   }

   purchaseCancelHandler=()=>{
       this.setState({purchasing:false})
   }

   purchaseContinueHandler=()=>{
     this.props.onInitPurchase();
     this.props.history.push('/checkout')
   }

  render() {
      console.log('this.props.ings',this.props.ings)
    
    const disabledInfo={
        ...this.props.ings
    } 
    
    for(let key in disabledInfo){
        disabledInfo[key]=disabledInfo[key]<=0;
    }
    
    let orderSummary=null;
    
    let burger=this.props.error ?<p>Igrediends can't be loaded...</p>:<Spinner/>
    if(this.props.ings){
        burger= (
            <Aux>
             <Burger 
             //On je nastojao svugdje zamjenio this.state.ingredients sa ovim, iako mu je ostalo još, ali ni ja onda još neću maknuti sve.
            ingredients={this.props.ings}
            />
            <BuildControls
            //U komponeti BuildControls ubacujemo podatke koje trebamo kao parametar fn. onIngredinetAdded i onIngredinetRemoved
            ingredientAdded={this.props.onIngredientAdded}
            ingredientRemoved={this.props.onIngredientRemoved}
            disabled={disabledInfo}
            //Malo neobična sitaucija. Svaki puta kada se renda ova komponenta će se pozvati ova funkcija na ovom propu purchesable.
            purchasable={this.updatePurchaseState(this.props.ings)}
            ordered={this.purchaseHandler}
            price={this.props.price}/>
            </Aux>
            )
            orderSummary=   <OrderSummary 
            ingredients={this.props.ings}
            price={this.props.price}
            purchaseCancelled={this.purchaseCancelHandler}
            purchaseContinued={this.purchaseContinueHandler}/> 
    }
    
      return (
          <Aux>
               <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler} >
                   {orderSummary}
                  </Modal>
                  {burger}
          </Aux>
        );
    }
}

const mapStateToProps=state=>{
    return{
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error
    }
}

const mapDispatchToProps=dispatch=>{
    return{
        onIngredientAdded: (ingName)=>dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName)=>dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: ()=>dispatch(actions.initIngredients()),
        onInitPurchase: ()=> dispatch(actions.purchaseInit())
    }
}
//Samo je trebalo imati nested fn.call kada im već exportamo higher order fn.
export default connect(mapStateToProps,mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));